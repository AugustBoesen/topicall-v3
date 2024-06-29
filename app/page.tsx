import Image from 'next/image';
import App from './components/app';
import Header from './components/layout/header';

export default function Home() {
  return (
    <main>
      <Header />
      <App />
    </main>
  );
}
