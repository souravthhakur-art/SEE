import Link from "next/link";

export default function NotFound() {
  return (
    <section className="section-padding py-24 md:py-40">
      <div className="max-w-xl mx-auto text-center">
        <p className="label mb-4">404</p>
        <h1 className="heading-lg mb-6">Page Not Found</h1>
        <p className="body-lg mb-10">
          The page you're looking for doesn't exist, or may have moved.
        </p>
        <Link href="/" className="btn-primary">
          Back to Home
        </Link>
      </div>
    </section>
  );
}
