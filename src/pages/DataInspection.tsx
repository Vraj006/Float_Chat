import Navbar from "@/components/Navbar";
import DataInspector from "@/components/DataInspector";

const DataInspection = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="pt-20 px-6 pb-12">
        <div className="container mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Supabase Data Inspection
            </h1>
            <p className="text-muted-foreground">
              Analyzing your database structure and content to optimize the visualization dashboard
            </p>
          </div>
          <DataInspector />
        </div>
      </div>
    </div>
  );
};

export default DataInspection;