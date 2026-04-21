import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Filters from "./components/Filters";
import BlogGrid from "./components/BlogGrid";
import Footer from "./components/Footer";

export default function App() {
  return (
    <div className="min-h-screen">
      <Navbar />
      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto">
        <Hero />
        <Filters />
        <BlogGrid />
      </main>
      <Footer />
    </div>
  );
}
