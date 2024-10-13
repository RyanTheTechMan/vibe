'use client';

import React, { useState, useEffect } from "react";
import { Spinner } from "@nextui-org/spinner";
import { Button } from "@nextui-org/button";
import { Input } from "@nextui-org/input";
import { FaPaperPlane } from "react-icons/fa";
import {Card, CardHeader, CardBody, CardFooter} from "@nextui-org/card";

type Name = {
    id: number;
    name: string;
};

const DashboardClient = ({ initialNames }: { initialNames: Name[] }) => {
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isHovered, setIsHovered] = useState(false);
    const [names, setNames] = useState<Name[]>(initialNames);

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
            // Fetch the updated list of names
            fetchNames();
        } catch (err: any) {
            console.error(err);
            setError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const fetchNames = async () => {
        try {
            const res = await fetch("/api/get-names");
            const data = await res.json();
            if (res.ok && data.success) {
                setNames(data.data);
            } else {
                console.error("Failed to fetch names:", data.message);
            }
        } catch (error) {
            console.error("Fetch error:", error);
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
        <div className="flex flex-col items-center justify-center w-full">
            <h1 className="text-2xl font-semibold mb-6">Who are you?</h1>

            {/* Name Submission Form */}
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
            </form>

            {/* Display Success or Error Messages */}
            {error && <p className="mt-4 text-red-500 text-center">{error}</p>}
            {isSubmitted && <p className="mt-4 text-green-500 text-center">{"Name submitted successfully!"}</p>}

            {/* List of Submitted Names */}
            <div className="mt-8 w-full max-w-md">
                <h2 className="text-xl font-semibold mb-4">Submitted Names</h2>
                <ul className="space-y-2">
                    {names.map((person) => (
                        <li key={person.id}>
                            <Card>
                                <CardBody>
                                    <p>{person.name}</p>
                                </CardBody>
                            </Card>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
};

export default DashboardClient;
