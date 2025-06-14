"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Mail, Lock, Eye, EyeOff, User, Image } from "lucide-react";

const signupSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters")
        .regex(
            /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
            "Password must contain at least one uppercase letter, one lowercase letter, and one number"
        ),
    full_name: z
        .string()
        .min(2, "Full name must be at least 2 characters")
        .max(50, "Full name must be less than 50 characters"),
    image_url: z.string().url("Please enter a valid image URL"),
});

export type SignupFormData = z.infer<typeof signupSchema>;

export default function SignupForm({ onSubmit, isLoading }: {
    onSubmit: (data: SignupFormData) => Promise<void>;
    isLoading: boolean;
}) {
    const [showPassword, setShowPassword] = useState(false);

    const form = useForm<SignupFormData>({
        resolver: zodResolver(signupSchema),
        defaultValues: {
            email: "ayush@gmail.com",
            password: "Ayushdixit@123",
            full_name: "Ayush Dixit",
            image_url: "https://static.vecteezy.com/system/resources/thumbnails/036/324/708/small/ai-generated-picture-of-a-tiger-walking-in-the-forest-photo.jpg",
        },
    });

    return (
        <Form {...form}>
            <div className="space-y-4">
                <FormField
                    control={form.control}
                    name="full_name"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                                Full Name
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        {...field}
                                        placeholder="Enter your full name"
                                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                                Email Address
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        {...field}
                                        type="email"
                                        placeholder="Enter your email"
                                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                                Password
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        {...field}
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Create a strong password"
                                        className="pl-10 pr-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="h-4 w-4" />
                                        ) : (
                                            <Eye className="h-4 w-4" />
                                        )}
                                    </button>
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="image_url"
                    render={({ field }) => (
                        <FormItem>
                            <FormLabel className="text-gray-700 font-medium">
                                Profile Image URL
                            </FormLabel>
                            <FormControl>
                                <div className="relative">
                                    <Image className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                    <Input
                                        {...field}
                                        type="url"
                                        placeholder="https://example.com/your-image.jpg"
                                        className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                                    />
                                </div>
                            </FormControl>
                            <FormMessage className="text-red-500" />
                        </FormItem>
                    )}
                />

                <Button
                    type="submit"
                    onClick={form.handleSubmit(onSubmit)}
                    className="w-full h-12 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200"
                    disabled={isLoading}
                >
                    {isLoading ? "Creating Account..." : "Create Account"}
                </Button>
            </div>
        </Form>
    );
}
