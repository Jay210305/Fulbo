import logoImage from 'figma:asset/de50d61e8377d6db4aad95a7d84860acb5619162.png';

interface LogoProps {
  variant?: 'default' | 'white';
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ variant = 'default', size = 'md' }: LogoProps) {
  const textColor = variant === 'white' ? 'text-white' : 'text-[#289B5F]';
  
  const sizeClasses = {
    sm: { img: 'w-12 h-12', text: 'text-xl' },
    md: { img: 'w-20 h-20', text: 'text-3xl' },
    lg: { img: 'w-32 h-32', text: 'text-5xl' }
  };

  const dimensions = sizeClasses[size];

  return (
    <div className="flex flex-col items-center gap-3">
      <div className={dimensions.img}>
        <img
          src={logoImage}
          alt="Fulbo Logo"
          className={`w-full h-full object-contain ${variant === 'white' ? 'brightness-0 invert' : ''}`}
        />
      </div>
      
      <h1 
        className={`${dimensions.text} ${textColor} tracking-[0.2em]`} 
        style={{ fontWeight: 800, letterSpacing: '0.15em' }}
      >
        FULBO
      </h1>
    </div>
  );
}
