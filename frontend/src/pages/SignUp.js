import React, { useState } from "react";
import HeaderWrapper from "../components/Header/HeaderWrapper";
import NavBar from "../components/Header/NavBar";
import Logo from "../components/Header/Logo";
import FooterCompound from "../compounds/FooterCompound";
import SignFormWrapper from "../components/SignForm/SignFormWrapper";
import SignFormBase from "../components/SignForm/SignFormBase";
import SignFormTitle from "../components/SignForm/SignFormTitle";
import SignFormInput from "../components/SignForm/SignFormInput";
import SignFormButton from "../components/SignForm/SignFormButton";
import SignFormText from "../components/SignForm/SignFormText";
import SignFormLink from "../components/SignForm/SignFormLink";
import SignFormCaptcha from "../components/SignForm/SignFormCaptcha";
import SignFormError from "../components/SignForm/SignFormError";
import Warning from "../components/Header/Warning";
import { useNavigate } from "react-router-dom";

const SignUp = () => {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("client");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const IsInvalid = password === "" || email === "" || username === "";

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password, role }),
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("userName", data.user.username);
        localStorage.setItem("userEmail", data.user.email);
        navigate("/");
      } else {
        setError(data.message || "Erreur lors de l'inscription");
      }
    } catch (err) {
      setError("Une erreur est survenue");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <HeaderWrapper className="header-wrapper-home">
        <NavBar className="navbar-signin">
          <Logo />
        </NavBar>
        <SignFormWrapper>
          <SignFormBase onSubmit={handleSubmit} method="POST">
            <Warning>Cinema Medina</Warning>
            <SignFormTitle>S'inscrire</SignFormTitle>
            {error && <SignFormError>{error}</SignFormError>}
            <SignFormInput
              type="text"
              placeholder="Nom d'utilisateur"
              value={username}
              onChange={({ target }) => setUsername(target.value)}
            />
            <SignFormInput
              type="email"
              placeholder="Adresse email"
              value={email}
              onChange={({ target }) => setEmail(target.value)}
            />
            <SignFormInput
              type="password"
              placeholder="Mot de passe"
              autoComplete="off"
              value={password}
              onChange={({ target }) => setPassword(target.value)}
            />
            <SignFormButton disabled={IsInvalid || isLoading}>
              {isLoading ? "Inscription en cours..." : "S'inscrire"}
            </SignFormButton>
            <SignFormText>
              Déjà membre? <SignFormLink href="/signin">Connectez-vous</SignFormLink>
            </SignFormText>
            <SignFormCaptcha>
              Cette page est protégée par Google reCAPTCHA.
            </SignFormCaptcha>
          </SignFormBase>
        </SignFormWrapper>
      </HeaderWrapper>
      <FooterCompound />
    </>
  );
};

export default SignUp;