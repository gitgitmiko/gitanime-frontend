import Link from 'next/link';

export default function ServerErrorPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-4">⚠️</div>
      <h1 className="text-3xl font-bold text-white mb-2">Terjadi Kesalahan Server</h1>
      <p className="text-dark-300 mb-6">Silakan coba lagi nanti atau kembali ke beranda.</p>
      <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
    </div>
  );
}


