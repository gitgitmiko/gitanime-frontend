import Link from 'next/link';

export default function NotFoundPage() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
      <div className="text-6xl mb-4">🗺️</div>
      <h1 className="text-3xl font-bold text-white mb-2">Halaman Tidak Ditemukan</h1>
      <p className="text-dark-300 mb-6">Maaf, halaman yang Anda cari tidak tersedia.</p>
      <Link href="/" className="btn-primary">Kembali ke Beranda</Link>
    </div>
  );
}


