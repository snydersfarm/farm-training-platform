import Image from 'next/image';

export default function ImageTest() {
  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Image Test</h1>
      {/* Using Next.js Image component for optimal loading */}
      <Image
        src="/images/myImage.jpg"
        alt="Public Image"
        width={500}
        height={300}
        className="rounded-lg shadow-md"
      />
    </div>
  );
} 