import Head from 'next/head';

export default function Terms() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Head>
        <title>Syarat & Ketentuan - GitAnime</title>
        <meta name="robots" content="noindex,follow" />
        <link rel="canonical" href="https://gitanime-web.vercel.app/terms" />
      </Head>
      <h1 className="text-3xl font-bold text-white mb-2">Syarat & Ketentuan</h1>
      <p className="text-dark-300">Terakhir diperbarui: {new Date().toLocaleDateString('id-ID')}</p>
      <p className="text-dark-200">Dengan menggunakan situs ini, Anda setuju dengan syarat dan ketentuan berikut.</p>
      <h2 className="text-xl font-semibold text-white mt-4">Penggunaan</h2>
      <p className="text-dark-200">Layanan disediakan apa adanya. Konten video berasal dari sumber pihak ketiga.</p>
      <h2 className="text-xl font-semibold text-white mt-4">Batasan Tanggung Jawab</h2>
      <p className="text-dark-200">Kami tidak bertanggung jawab atas gangguan layanan atau konten pihak ketiga.</p>
      <h2 className="text-xl font-semibold text-white mt-4">Perubahan</h2>
      <p className="text-dark-200">Syarat dapat diubah sewaktu-waktu tanpa pemberitahuan.</p>
    </div>
  );
}


