import Header from "../header";

export default function Home() {
  return (
    <div className="flex flex-col justify-center items-center gap-6 w-full pt-20 md:pt-24">
      <Header />
      <div className="p-4 rounded-md text-center">
        <p className="text-lg">To vsebino vidite samo, ker ste prijavljeni.</p>
      </div>
    </div>
  );
}
