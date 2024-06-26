import { Avatar, Button, Flex, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { useForm } from "@mantine/form";
import { PasswordInput, TextInput } from "@mantine/core";
import Link from "next/link";
import { Divider } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { faEnvelope, faLock, faUser } from "@fortawesome/free-solid-svg-icons";
import { NextPageWithLayout } from "./_app";
import Layout from "@/components/Auth/Layout";
import Navbar from "@/components/Auth/Navbar";
import Banner from "@/components/Auth/Banner";

const SignUp: NextPageWithLayout = () => {
  const [signInWithGoogle, guser, gloading, gerror] = useSignInWithGoogle(auth);
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();
  const [isLoading,setIsLoading] = useState<boolean>(false);

  const handleSignInWithGoogle = async () => {
    setIsLoading(true);
    try {
      const user = await signInWithGoogle();
      const token = await user!.user.getIdToken();
      if(user?.user.metadata.creationTime===user?.user.metadata.lastSignInTime) {
        await fetch('http://127.0.0.1:5000/api/sign-up',{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`, 
          },
          body: JSON.stringify({
            "name": user!.user.displayName, 
            "email": user!.user.email, 
          }),
        });
        router.push("/");
      }
      else {
        await fetch('http://127.0.0.1:5000/api/sign-in',{
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `${token}`, 
          },
          body: JSON.stringify({
            "email": user!.user.email, 
          }),
        });
        router.push("/");
      }
    } catch (error) {
      console.error("Error during OAuth sign-in:", error);
    }
    setIsLoading(false);
  };

  const form = useForm({
    initialValues: { name: "", email: "", password: "" },
    validate: {
      name: (value) =>
        value.length < 3 ? "Name must have at least 3 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
      password: (value) =>
        value.length < 6 ? "Password must be of atleast 6 length" : null,
    },
  });

  return (
    <Stack w="100vw" maw="100%" h="100vh" mb="10vh" pl="5vw" pr="5vw" gap={0}>
      <Navbar />
      <Flex
        direction={{ base: "column", sm: "column", md: "row", lg: "row" }}
        w="100vw"
        maw="100%"
        h="85svh"
        justify="center"
        align="center"
      >
        <Banner imageSrc="/assets/SignUp.png" />
        <Stack
          w={{ base: "90vw", sm: "90vw", md: "45vw", lg: "45vw" }}
          bg="white"
          justify="center"
          align="center"
        >
          <Stack w={{ base: "80vw", sm: "60vw", md: "30vw", lg: "30vw" }}>
            <Title order={1} size="h1">
              Sign Up
            </Title>
            <Text size="xl">Join EduHub-AI for Innovative Learning!</Text>
            <form
              onSubmit={form.onSubmit(async () => {
                const { email, password, name } = form.values;
                try {
                  const user = await createUserWithEmailAndPassword(email, password);
                  const token = await user!.user.getIdToken();
                  await fetch(
                    "http://127.0.0.1:5000/api/sign-up",
                    {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                        "Authorization": `${token}`,
                      },
                      body: JSON.stringify({
                        "name": name,
                        "email": email,
                      }),
                    }
                  );
                  router.push("/");
                } catch (error) {
                  console.error("Error during Custom sign-in:", error);
                }
              })}
            >
              <TextInput
                role="textbox"
                aria-label="name"
                name="name"
                placeholder="Name"
                radius="md"
                size="md"
                {...form.getInputProps("name")}
                leftSection={
                  <FontAwesomeIcon
                    icon={faUser}
                    color="black"
                  ></FontAwesomeIcon>
                }
                styles={{
                  input: {
                    borderColor: "black",
                  },
                }}
              />

              <TextInput
                role="email"
                name="email"
                placeholder="Your email"
                {...form.getInputProps("email")}
                mt="sm"
                radius="md"
                size="md"
                leftSection={
                  <FontAwesomeIcon
                    icon={faEnvelope}
                    color="black"
                  ></FontAwesomeIcon>
                }
                styles={{
                  input: {
                    borderColor: "black",
                  },
                }}
              />
              <PasswordInput
                role="password"
                name="password"
                mt="sm"
                mb="md"
                placeholder="Enter your password"
                {...form.getInputProps("password")}
                radius="md"
                size="md"
                leftSection={
                  <FontAwesomeIcon
                    icon={faLock}
                    color="black"
                  ></FontAwesomeIcon>
                }
                styles={{
                  input: {
                    borderColor: "black",
                  },
                  visibilityToggle: {
                    color: "black",
                  },
                }}
              />

              <Button
                color="black"
                type="submit"
                mt="lg"
                size="md"
                radius="md"
                w={{ base: "80vw", sm: "60vw", md: "30vw", lg: "30vw" }}
                name="Sign Up"
                loading={isLoading}
              >
                Sign Up
              </Button>

              <Divider my="xs" label="OR" labelPosition="center" />

              <Button
                mb="xl"
                variant="default"
                w={{ base: "80vw", sm: "60vw", md: "30vw", lg: "30vw" }}
                onClick={handleSignInWithGoogle}
                size="md"
                radius="md"
                name="Sign up with Google"
              >
                <Avatar src="/assets/google.png"></Avatar>
                {"\u00A0\u00A0"}Sign up with Google
              </Button>

              <Text style={{ textAlign: "center", color: "grey" }}>
                Already have an account?{" "}
                <Link
                  href="signin"
                  style={{
                    color: "black",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Sign In
                </Link>
              </Text>
            </form>
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
};

SignUp.getLayout = Layout;

export default SignUp;
