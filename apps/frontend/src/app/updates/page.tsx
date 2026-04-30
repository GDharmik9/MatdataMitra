import CategoryList from "@/components/CategoryList";

export default function UpdatesPage() {
  return (
    <CategoryList 
      categoryFilter={["Election Updates", "Election SRC"]} 
      title="Election Updates & SRC" 
      description="Stay informed with the latest updates from the Election Commission of India and Summary Revision of Electoral Rolls."
    />
  );
}
