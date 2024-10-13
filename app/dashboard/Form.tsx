'use client';

import React, { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/spinner";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { FaPaperPlane } from "react-icons/fa";
import { useRouter } from 'next/navigation';

const Form = () => {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        setError(null);

        if (name.trim() === "") {
            setError("Please enter your name.");
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch("/api/submit-name", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ name }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Failed to submit name.");
            }

            const data = await response.json();
            console.log("Server Response:", data.message);
            setName(""); // Reset the input field
            setIsSubmitted(true);
            // Revalidate the names list
            router.refresh(); // Triggers re-render of Server Components
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
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row sm:items-center gap-4 w-full max-w-md">
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
            {/* Display Success or Error Messages */}
            {/*{error && <p className="mt-4 text-red-500 text-center">{error}</p>}*/}
            {/*{isSubmitted && <p className="mt-4 text-green-500 text-center">Name submitted successfully!</p>}*/}
        </form>
    );
};

export default Form;
