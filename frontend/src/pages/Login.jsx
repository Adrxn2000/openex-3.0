import useAuthStore from '../store/authStore';

function Login() {
  const username = useAuthStore((state) => state.username);

  return (
    <div>
      <h1>Login</h1>
      <p>Login form will go here.</p>
      <p>Currently logged in as: {username ?? 'nobody'}</p>
    </div>
  );
}

export default Login;