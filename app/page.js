import Image from "next/image";

export default function Home() {
  return (
    <div className="flex justify-center">
      
      <Image src={'/logo.png'} alt='logo'
                  width = {400}
                  height = {100}
                  className = 'w-45'
              />
    </div>
  );
}
