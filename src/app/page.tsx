import Link from "next/link";

const Home = () => {
  return (
    <main className="flex min-h-screen flex-col items-center pt-24">
      <ul className="w-[500px]">
        <h1>Router</h1>
        <li>
          <Link href={"/page1"}>Page 1</Link>
        </li>
      </ul>
    </main>
  );
};

export default Home;
