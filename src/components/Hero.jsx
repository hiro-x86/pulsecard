import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';
import {RocketIcon} from 'lucide-react';
import { Link } from 'react-router-dom';



const Hero = () => {

  const brandRef = useRef(null);
  const buttonRef = useRef(null);

  useEffect(() => {
    // Helper to split text into spans
    const splitText = (ref) => {
      const element = ref.current;
      const text = element.innerText;
      element.innerHTML = '';
      text.split('').forEach((char) => {
        const span = document.createElement('span');
        span.innerText = char === ' ' ? '\u00A0' : char;
        span.style.display = 'inline-block';
        element.appendChild(span);
      });
      return element.children;
    };

    
    const brandChars = splitText(brandRef);
    

    const tl = gsap.timeline();


    tl.fromTo(brandChars, 
      { x: 100, opacity: 0 }, 
      { x: 0, duration: 0.8, opacity: 1, stagger: 0.08, ease: "elastic.out(1,0.5)" }
    )
    
  
    .fromTo(buttonRef.current, 
      { scale: .3, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.6, ease: 'power2.out' }
    );

  }, []);

  return (
    <section className='relative h-screen isolate w-full flex flex-col items-center bg-[#FAFAFA] justify-center px-4 overflow-hidden'>
      
      
      <div className="flex flex-col items-center text-center space-y-4">
      
        <h1
          ref={brandRef}
          className=' font-medium text-5xl heading md:text-7xl text-gray-950  uppercase mb-2'
        >
          pulsecard
        </h1>
        

        <div className="fixed bottom-10 inset-x-0 flex justify-center md:static md:mt-10">
          <Link to="/courses">
            <button
            ref={buttonRef}
            className=" button cursor-pointer text-white border-2 border-gray-950 px-7 py-3
                 flex items-center rounded-full max-sm:px-15 text-[18px] font-extrabold">
            <RocketIcon className="w-5 h-5 mr-1" />
              Sign-in
            </button>
        </Link>
      </div>
      </div>
    </section>
  );
}

export default Hero;