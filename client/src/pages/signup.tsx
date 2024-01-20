import { Button, Flex, Group, Image, Stack, Text, Title } from "@mantine/core";
import React from "react";
import { useForm } from '@mantine/form';
import { PasswordInput, Box, TextInput } from '@mantine/core';
import Link from "next/link";
import { Divider, Anchor } from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faGoogle
} from "@fortawesome/free-brands-svg-icons";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useState } from "react";

const SignUp: React.FC = () => {
    const form = useForm({
        initialValues: { name: '', email: '', password: '', },
        validate: {
            name: (value) => (value.length < 3 ? 'Name must have at least 3 letters' : null),
            email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
        },
    });

    const [showPassword, setShowPassword] = useState(false);

    const handleTogglePassword = () => {
        setShowPassword((prevShowPassword) => !prevShowPassword);
    };

    return (
        <Flex
            direction={{ sm: "column", md: "column-reverse", lg: "row" }}
            w="100vw"
            maw="100%"
            h="85vh"
            mb='10vh'
            pl='5vw'
            pr='5vw'
        >
            <Flex w="45vw">
                <Image
                    src="/assets/SignUp.png"
                    fallbackSrc="https://placehold.co/600x400?text=Placeholder"
                />
            </Flex>
            <Stack w="45vw" bg="white" justify="center" align='center'>
                <Stack w='30vw'>
                    <Title order={1} size="h1">Sign Up</Title>
                    <Text size="xl">
                        Join EduHub-AI for Innovative Learning!
                    </Text>
                    <form onSubmit={form.onSubmit((values) => console.log(values))}>

                        <TextInput placeholder="Name" radius="md"
                            size="md" {...form.getInputProps('name')} />

                        <TextInput
                            placeholder="Your email"
                            {...form.getInputProps('email')}
                            mt="sm"
                            radius="md"
                            size="md"
                        />
                        <PasswordInput
                            mt="sm"
                            mb="md"
                            placeholder="Enter your password"
                            {...form.getInputProps('password')}
                            radius="md"
                            size="md"
                        />

                        <Link href="signup" passHref>
                            <Button color="black" type="submit" mt="lg" size="md" radius="md" w='30vw'>
                                Sign Up
                            </Button>
                        </Link>

                        <Divider my="xs" label="OR" labelPosition="center" />

                        <Button mb="xl" variant="default" type="submit" w='30vw'>
                            <FontAwesomeIcon icon={faGoogle} color="black" size="xl" />{"\u00A0\u00A0"}Sign up with Google
                        </Button>

                        <Text style={{ textAlign: "center", color: "grey" }}>Already have an account?{" "}
                            <Link href="signin" style={{ color: "black", textDecoration: "none", fontWeight: "bold" }}>Sign In</Link>
                        </Text>
                    </form>
                </Stack>
            </Stack>

        </Flex>
    );
};

export default SignUp;
