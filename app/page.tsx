"use client";

import React, { useState, useEffect } from "react";
import { Button, Input, Spinner } from "@nextui-org/react";
import { FaPaperPlane } from "react-icons/fa";

export default function Home() {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);

        if (name.trim() === "") {
            setError("Please enter your name.");
            return;
        }

        setIsSubmitting(true);

        try {
            const submitPromise = fetch("/api/submit-name", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            const delayPromise = new Promise((resolve) => setTimeout(resolve, 500));

            const [response] = await Promise.all([submitPromise, delayPromise]);

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit name.");
            }

            const data = await response.json();
            console.log("Server Response:", data.message);
            setName(""); // Reset the input field
            setIsSubmitted(true);
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isSubmitted) {
            const timer = setTimeout(() => {
                setIsSubmitted(false);
            }, 3000);

            return () => clearTimeout(timer);
        }
    }, [isSubmitted]);

    return (
        <div className="min-h-screen flex flex-col">
            <main className="flex-grow flex justify-center px-4 py-8">
                <div className="w-full max-w-md">
                    <h1 className="text-2xl font-semibold mb-6 text-center">Who are you?</h1>

                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <Input
                            name="username"
                            color="primary"
                            size="md"
                            radius="md"
                            placeholder="Enter your name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            isRequired
                            aria-label="Name"
                            fullWidth
                            disabled={isSubmitting} // Disable input during submission
                        />
                        <Button
                            type="submit"
                            variant={name.trim() === "" ? "ghost" : "solid"}
                            color={isSubmitted ? "success" : error ? "danger" : "primary"}
                            size="md"
                            radius="md"
                            isDisabled={!isSubmitted && name.trim() === ""}
                            className="sm:w-auto w-full flex items-center justify-center transition-all duration-300"
                            onMouseEnter={() => setIsHovered(true)}
                            onMouseLeave={() => setIsHovered(false)}
                        >
                            {isSubmitting ? (
                                <Spinner color="current" size="sm" />
                            ) : isSubmitted ? (
                                "Submitted!"
                            ) : isHovered ? (
                                <FaPaperPlane className="text-lg" />
                            ) : error ? (
                                "Error"
                            ) : (
                                "Submit"
                            )}
                        </Button>
                    </form>

                    {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
                </div>
            </main>
        </div>
    );
}