import { Link } from "react-router";
import { Button } from "../ui/button";

export default function Home() {
  return (
    <>
      <h1 className="text-3xl font-semibold text-center">Diplomska naloga</h1>
      <div className="flex justify-center mt-6">
        <Link to="/login">
          <Button>Prijava</Button>
        </Link>
      </div>
    </>
  );
}
