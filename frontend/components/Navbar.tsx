import Link from "next/link";
const Navbar = () => {
  return (
    <nav className="bg-gray-800 p-4">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          NFT Market
        </Link>
        <div className="space-x-4">
          <Link href="/" className="hover:text-blue-400">
            Home
          </Link>
          <Link href="/editor" className="hover:text-blue-400">
            Editor
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
