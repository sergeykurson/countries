import Link from "next/link";

export default function Navbar() {
  return (
    <Link href="/">
      <a className="text-5xl pb-4 text-center">
        Fun with Countries
      </a>
    </Link>
  );
}
