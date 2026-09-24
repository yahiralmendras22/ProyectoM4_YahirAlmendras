import mateIcon from '../assets/mate.svg';

export function Home() {
  return (
    <div className="home-container">
      <img src={mateIcon} alt="Mate con bombilla" style={{ width: '160px', margin: '0 auto 1rem' }} />
      <h1>✅ MateCode Tasks</h1>
      <p>Organizá tus tareas diarias de forma simple y accesible desde cualquier dispositivo.</p>
    </div>
  );
}