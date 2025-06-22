import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Confirm = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const fullHash = window.location.href.split("#");
    const tokenPart = fullHash[2]; // after second '#'

    if (tokenPart) {
      const params = new URLSearchParams(tokenPart);
      const access_token = params.get("access_token");
      const refresh_token = params.get("refresh_token");

      if (access_token && refresh_token) {
        localStorage.setItem("token", access_token);
        navigate("/dashboard");
      }
    }
  }, []);

  return <div>Completing sign-up... please wait.</div>;
};

export default Confirm;
