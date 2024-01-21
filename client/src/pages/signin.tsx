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
import React, { ReactElement, useEffect } from "react";
import { useForm } from "@mantine/form";
import { PasswordInput, Box, TextInput } from "@mantine/core";
import Link from "next/link";
import { Divider, Anchor } from "@mantine/core";
import { IconSearch } from "@tabler/icons-react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGoogle } from "@fortawesome/free-brands-svg-icons";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";
import {
  useSignInWithEmailAndPassword,
  useSignInWithGoogle,
} from "react-firebase-hooks/auth";
import { auth } from "@/firebase/clientApp";
import { useRouter } from "next/router";
import { faEnvelope, faLock } from "@fortawesome/free-solid-svg-icons";
import { NextPageWithLayout } from "./_app";
import Head from "next/head";

const SignIn: NextPageWithLayout = () => {
  const router = useRouter();
  const [signInWithGoogle, guser, gloading, gerror] = useSignInWithGoogle(auth);
  const [signInWithEmailAndPassword, user, loading, error] =
    useSignInWithEmailAndPassword(auth);
  const form = useForm({
    initialValues: { email: "", password: "" },
    validate: {
      email: (value) => (/^\S+@\S+$/.test(value) ? null : "Invalid email"),
    },
  });

  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePassword = () => {
    setShowPassword((prevShowPassword) => !prevShowPassword);
  };

  const handleOAuthSign = async () => {
    await signInWithGoogle();
    if (!gerror) router.push("/");
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
            src="/assets/SignIn.png"
            fallbackSrc="https://placehold.co/600x400?text=Placeholder"
          />
        </Flex>
        <Stack w="45vw" bg="white" justify="center" align="center">
          <Stack w="30vw">
            <Title order={1} size="h1">
              Sign In
            </Title>
            <Text size="xl">Welcome back! Continue with EduHub-AI.</Text>
            <form
              onSubmit={form.onSubmit(async (values) => {
                const { email, password } = values;
                await signInWithEmailAndPassword(email, password);
                if (!error) router.push("/");
              })}
            >
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
              <Flex>
                <Link
                  href="signin"
                  style={{
                    color: "black",
                    textDecoration: "none",
                    marginLeft: "auto",
                  }}
                >
                  Forgot password?
                </Link>
              </Flex>

              <Button
                color="black"
                type="submit"
                mt="lg"
                size="md"
                radius="md"
                w="30vw"
              >
                Sign In
              </Button>

              <Divider my="xs" label="OR" labelPosition="center" />

              <Button
                mb="xl"
                variant="default"
                w="30vw"
                size="md"
                radius="md"
                onClick={handleOAuthSign}
              >
                <Avatar src="/assets/google.png"></Avatar>
                {"\u00A0\u00A0"}Sign in with Google
              </Button>

              <Text style={{ textAlign: "center", color: "grey" }}>
                Don't have an account?{" "}
                <Link
                  href="signup"
                  style={{
                    color: "black",
                    textDecoration: "none",
                    fontWeight: "bold",
                  }}
                >
                  Sign Up
                </Link>
              </Text>
            </form>
          </Stack>
        </Stack>
      </Flex>
    </Stack>
  );
};

SignIn.getLayout = function getLayout(page: ReactElement) {
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

export default SignIn;