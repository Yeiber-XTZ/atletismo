import Navbar from './components/Navbar';
import Hero from './components/Hero';
import StatsBar from './components/StatsBar';
import LatestUpdates from './components/LatestUpdates';
import Newsletter from './components/Newsletter';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50 selection:bg-brand-green selection:text-white">
      <Navbar />
      <main>
        <Hero />
        <StatsBar />
        <LatestUpdates />
        <Newsletter />
      </main>
      <Footer />
    </div>
  );
}
