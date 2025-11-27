import shieldLogo from '../../assets/2068dbd9380c484f3b804acfa0e6103786f83524.png';

export function SplashScreen() {
  return (
    <div className="min-h-screen bg-[#289B5F] flex flex-col items-center justify-center p-6">
      <div className="text-center space-y-6">
        <div className="w-48 h-48 mx-auto flex items-center justify-center">
          <img
            src={shieldLogo}
            alt="Fulbo Shield Logo"
            className="w-full h-full object-contain"
          />
        </div>
        <h1 className="text-5xl text-white tracking-[0.15em]" style={{ fontWeight: 800 }}>
          FULBO
        </h1>
      </div>
    </div>
  );
}
