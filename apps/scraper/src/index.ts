import * as admin from 'firebase-admin';
import puppeteer from 'puppeteer';
import * as dotenv from 'dotenv';
import path from 'path';

// Load environment variables (useful for local testing)
dotenv.config({ path: path.resolve(__dirname, '../../.env') });

// Initialize Firebase Admin (Firestore)
if (!admin.apps.length) {
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT) {
      const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
      console.log('Firebase Admin initialized via Service Account Key');
    } else {
      admin.initializeApp();
      console.log('Firebase Admin initialized via Application Default Credentials');
    }
  } catch (error) {
    console.error('Failed to initialize Firebase Admin:', error);
    process.exit(1);
  }
}

const db = admin.firestore();

async function scrapeVoterServices() {
  console.log('Launching Puppeteer to scrape ECI Voters Portal...');
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  try {
    const targetUrl = 'https://voters.eci.gov.in/';
    console.log(`Navigating to ${targetUrl}...`);
    
    // Wait until network is idle since it is a React SPA
    await page.goto(targetUrl, { waitUntil: 'networkidle2', timeout: 60000 });

    // Wait for the main service cards to render
    await page.waitForSelector('.form6786A6B', { timeout: 10000 });
    console.log('Successfully loaded ECI Voters Portal and found service cards.');

    // Extract the services dynamically from the page
    const scrapedServices = await page.evaluate(() => {
      const services: any[] = [];
      
      // Select all service cards on the right-hand grid
      const cards = document.querySelectorAll('.form6786A6B');
      
      cards.forEach((card, index) => {
        // The first <p> is usually the Title, the second <p> is the Description
        const paragraphs = card.querySelectorAll('p');
        const title = paragraphs[0]?.textContent?.trim() || 'Unknown Service';
        const description = paragraphs[1]?.textContent?.trim() || '';
        
        // Grab the aria-label which sometimes contains routing info or action description
        const actionLabel = card.getAttribute('aria-label') || '';

        // Only add if it has a real title
        if (title && title !== 'Unknown Service') {
          services.push({
            id: `voter-service-${index}`,
            title_en: title,
            description_en: description,
            actionLabel: actionLabel,
            source_url: 'https://voters.eci.gov.in/',
            category: 'Voter Services',
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      return services;
    });

    // Hardcode the known official PDF URLs for guidelines based on our portal analysis
    const staticForms = [
      { id: 'form-6', title_en: 'Form 6: New Voter Registration', pdf_en: 'https://voters.eci.gov.in/guidelines/Form-6_en.pdf', category: 'Forms & Guidelines' },
      { id: 'form-6a', title_en: 'Form 6A: NRI Voter Registration', pdf_en: 'https://voters.eci.gov.in/guidelines/Form-6A_en.pdf', category: 'Forms & Guidelines' },
      { id: 'form-7', title_en: 'Form 7: Deletion of Name', pdf_en: 'https://voters.eci.gov.in/guidelines/Form-7_en.pdf', category: 'Forms & Guidelines' },
      { id: 'form-8', title_en: 'Form 8: Correction of Entries', pdf_en: 'https://voters.eci.gov.in/guidelines/Form-8_en.pdf', category: 'Forms & Guidelines' }
    ];

    console.log(`Extracted ${scrapedServices.length} voter services. Adding ${staticForms.length} official PDF Forms and Guidelines...`);

    const batch = db.batch();
    
    // Process Services
    for (const item of scrapedServices) {
      const finalItem = {
        ...item,
        title_hi: `${item.title_en} (Hindi Translation Pending)`,
        title_mr: `${item.title_en} (Marathi Translation Pending)`,
      };
      const docRef = db.collection('voter_services').doc(item.id);
      batch.set(docRef, finalItem);
    }

    // Process Forms
    for (const form of staticForms) {
      const docRef = db.collection('voter_services').doc(form.id);
      batch.set(docRef, form);
    }

    await batch.commit();
    console.log('Successfully pushed Voter Services data to Firestore!');

  } catch (error) {
    console.error('Error during scraping:', error);
  } finally {
    await browser.close();
  }
}

// Run the scraper
scrapeVoterServices()
  .then(() => {
    console.log('Scraper job finished successfully.');
    process.exit(0);
  })
  .catch((err) => {
    console.error('Scraper job failed:', err);
    process.exit(1);
  });
