import { motion } from "motion/react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 w-full z-50 bg-surface/80 backdrop-blur-md flex justify-between items-center px-8 py-4 max-w-full mx-auto">
      <div className="text-2xl font-black italic text-primary font-headline uppercase tracking-tight">
        Chocó Athletic
      </div>
      <div className="hidden md:flex gap-8 items-center">
        <a className="text-primary font-bold border-b-4 border-primary font-headline uppercase tracking-tight" href="#">Articles</a>
        <a className="text-tertiary font-medium hover:text-primary hover:bg-surface-container-low/50 transition-colors font-headline uppercase tracking-tight" href="#">Video</a>
        <a className="text-tertiary font-medium hover:text-primary hover:bg-surface-container-low/50 transition-colors font-headline uppercase tracking-tight" href="#">Galleries</a>
        <a className="text-tertiary font-medium hover:text-primary hover:bg-surface-container-low/50 transition-colors font-headline uppercase tracking-tight" href="#">Stats</a>
        <a className="text-tertiary font-medium hover:text-primary hover:bg-surface-container-low/50 transition-colors font-headline uppercase tracking-tight" href="#">Schedule</a>
      </div>
      <div className="flex items-center gap-4">
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="bg-primary text-on-primary px-6 py-2 slanted-edge font-bold tracking-tight uppercase hover:opacity-90 transition-all"
        >
          Subscribe
        </motion.button>
        <div className="w-10 h-10 rounded-full overflow-hidden bg-surface-container">
          <img 
            alt="Athlete Profile" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuB_Qj8Rk2QTm0qlHRlB_UFh6b23GmJ0mwaAj4pjLos21lhcPgizmSM_OAhg0XzXpF_Asl_iE_NefAiSCcCjLku8Bi5ZnFHUihgXYh6oFMAq5CWE8VNoPJ_5ydLsDFkZScRtpWzx2-zSN9sjxQumoGbbRge2JnDxE2EGTC4Xx2MDWpAZr7LmTuG-u0YsjVVBUM_wmCrIlmIGuRI_l4vb0dSOEQsT1AQCzVm7IUV1eMTUsYGbaI09Ieh2ZkLIwa4_xGxYMzwVzmfOripS" 
            referrerPolicy="no-referrer"
          />
        </div>
      </div>
    </nav>
  );
}
