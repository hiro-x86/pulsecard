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
      { x: 0, duration: 0.8, opacity: 1, stagger: 0.05, ease: "elastic.out(1,0.5)" }
    )
    
  
    .fromTo(buttonRef.current, 
      { scale: 0, opacity: 0 }, 
      { scale: 1, opacity: 1, duration: 0.4, ease: 'power2.out' }
    );

  }, []);

  return (
    <section className='relative h-screen isolate w-full flex flex-col items-center bg-[#050505] justify-center px-4 overflow-hidden select-none perspective-distant'>
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 blur-[100px] rounded-full" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 blur-[100px] rounded-full" />
      
      
      <div className="flex flex-col items-center text-center space-y-4">
      
        <h1
          ref={brandRef}
          className='font-medium text-5xl  tracking-normal font-["Inter Tight"] md:text-[100px] text-white uppercase mb-2'
        >
          pulsecard
        </h1>
        
      </div>

      <div className="fixed bottom-10 inset-x-0 flex justify-center md:static md:mt-30">
          <Link to="/courses">
            <button
            ref={buttonRef}
            className=" cursor-pointer text-white backdrop-blur-md rgba(255, 255, 255, 0.1) border-2 border-white/20 px-10 py-4
                 flex items-center  rounded-full max-sm:px-15 gap-2 max-sm:text-[18px] text-[24px] hover:gap-3  font-extrabold">
            <RocketIcon className="w-5 h-5 " />
              Sign-in
            </button>
        </Link>
      </div>
      
    </section>
  );
}

export default Hero;