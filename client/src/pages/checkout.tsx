import React, { useEffect, useState } from "react";
import {
  useStripe,
  useElements,
  Elements,
  PaymentElement,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { Button, Stack } from "@mantine/core";
import { NextPageWithLayout } from "./_app";
import EmptyLayout from "@/components/EmptyLayout";
import Navbar from "@/components/Auth/Navbar";
import CheckoutForm from "@/components/CheckoutForm";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

const checkout: NextPageWithLayout = () => {


  const [client_secret, set_client_secret] = useState<any>();

  useEffect(() => {
    const handleClickUpgrade = async () => {
      console.log("redirecting...");
      const response = await fetch(
        "http://127.0.0.1:5000/api/create-payment-intent",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email: "nikhilranjan1103@gmail.com",
          }),
        }
      );
      const { clientSecret } = await response.json();
      set_client_secret(clientSecret);
    };
    handleClickUpgrade();
  }, []);

  return (
    <Stack w="100vw" maw="100%" h="100vh" mb="10vh" pl="5vw" pr="5vw" gap={0}>
      <Navbar />
      <Stack w="50%">
        {client_secret ? (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret: client_secret }}
          >
            <CheckoutForm />
          </Elements>
        ) : null}
      </Stack>
    </Stack>
  );
};

checkout.getLayout = EmptyLayout;
export default checkout;
