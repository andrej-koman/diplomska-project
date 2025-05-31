import { useEffect, useState } from "react";
import Header from "@/components/header";

export default function Dashboard() {
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await fetch("/api/Auth/userdata");
        const data = await res.json();
        console.log(data);
      } catch (e) {
        console.error(e);
        setError("Napaka pri pridobivanju podatkov.");
      }
    };

    fetchData();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center gap-6 w-full">
      <Header />
      <h1>Dashboard</h1>
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}
