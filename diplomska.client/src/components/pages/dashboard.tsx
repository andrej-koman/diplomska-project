import { useEffect, useState } from "react";

export default function Dashboard() {
  const [text, setText] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // fetch the text from server, which is the body { text: "..." }
    const fetchData = async () => {
      try {
        const res = await fetch("/api/Auth/userdata");
        const data = await res.json();
        setText(data.test);
      } catch (e) {
        console.error(e);
        setError("Napaka pri pridobivanju podatkov.");
      }
    };

    fetchData();
  }, []);
  return (
    <div className="flex flex-col justify-center items-center gap-6">
      <h1>Dashboard</h1>
      {text && (
        <div className="p-4 rounded-md text-white flex flex-col justify-center items-center">
          <span>Ta tekst bi moral biti samo viden, kadar si prijavljen.</span>
          <span>{text}</span>
        </div>
      )}
      {error && <p className="text-red-500 text-sm mt-3">{error}</p>}
    </div>
  );
}
