import {
  Avatar,
  Button,
  Flex,
  Group,
  Image,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import React, { ReactElement } from "react";
import { useForm } from "@mantine/form";
import { PasswordInput, Box, TextInput } from "@mantine/core";
import Link from "next/link";
import { Divider } from "@mantine/core";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { useState } from "react";
import {
  useCreateUserWithEmailAndPassword,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import {
  faEnvelope,
  faLock,
  faSignature,
  faUser,
} from "@fortawesome/free-solid-svg-icons";
import Head from "next/head";
import { NextPageWithLayout } from "./_app";

const SignUp: NextPageWithLayout = () => {
  const [signInWithGoogle, guser, gloading, gerror] = useSignInWithGoogle(auth);
  const [createUserWithEmailAndPassword, user, loading, error] =
    useCreateUserWithEmailAndPassword(auth);
  const router = useRouter();

  const handleOAuthSign = async () => {
    await signInWithGoogle();
    if (!gerror) router.push("/");
  };

  const form = useForm({
    initialValues: { name: "", email: "", password: "" },
    validate: {
      name: (value) =>
        value.length < 3 ? "Name must have at least 3 letters" : null,
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  return (
    <Stack w="100vw" maw="100%" h="100vh" mb="10vh" pl="5vw" pr="5vw" gap={0}>
      <Flex h="15vh" justify="left" w="100vw" maw="100%">
        <Flex h="15vh">
          <Image
            src="/assets/logo.png"
            style={{ cursor: "pointer" }}
            onClick={() => router.push("/")}
          ></Image>
        </Flex>
      </Flex>
      <Flex
        direction={{ sm: "column", md: "column-reverse", lg: "row" }}
        w="100vw"
        maw="100%"
        h="85vh"
      >
        <Flex w="45vw">
          <Image
            src="/assets/SignUp.png"
            fallbackSrc="https://placehold.co/600x400?text=Placeholder"
          />
        </Flex>
        <Stack w="45vw" bg="white" justify="center" align="center">
          <Stack w="30vw">
            <Title order={1} size="h1">
              Sign Up
            </Title>
            <Text size="xl">Join EduHub-AI for Innovative Learning!</Text>
            <form
              onSubmit={form.onSubmit(async (values) => {
                const { email, password } = values;
                await createUserWithEmailAndPassword(email, password);
                if (!error) router.push("/");
              })}
            >
              <TextInput
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
                w="30vw"
              >
                Sign Up
              </Button>

              <Divider my="xs" label="OR" labelPosition="center" />

              <Button
                mb="xl"
                variant="default"
                w="30vw"
                onClick={handleOAuthSign}
                size="md"
                radius="md"
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

SignUp.getLayout = function getLayout(page: ReactElement) {
  const router = useRouter();
  return (
    <>
      <Head>
        <title>Sign In</title>
      </Head>
      {page}
    </>
  );
};

export default SignUp;