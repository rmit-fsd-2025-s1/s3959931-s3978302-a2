import React from "react";
import Layout from "../components/layout/Layout";
import Link from "next/link";
import Head from "next/head";

export default function SignUp() {
    return (
        <>
            <Head>
                <title>TeachTeam - Sign Up</title>
            </Head>
            <Layout>
                <div className="flex items-center justify-center py-16">
                    <div className="circle-form">
                        <div className="alert alert-info bg-blue-100 border border-blue-500 text-blue-800">
                            <p>Sign up functionality will be implemented soon.</p>
                        </div>

                        <form>
                            <h2 className="text-center text-2xl font-bold mb-6" style={{ color: "var(--color-primary)" }}>
                                Create Account
                            </h2>

                            <div className="mb-4">
                                <input type="text" placeholder="Full Name" disabled />
                            </div>

                            <div className="mb-4">
                                <input type="email" placeholder="Email Address" disabled />
                            </div>

                            <div className="mb-4 relative">
                                <input type="password" placeholder="Password" disabled />
                                <button type="button" className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                        <path
                                            fillRule="evenodd"
                                            d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-1.473-1.473A10.014 10.014 0 0019.542 10C18.268 5.943 14.478 3 10 3a9.958 9.958 0 00-4.512 1.074l-1.78-1.781zm4.261 4.26l1.514 1.515a2.003 2.003 0 012.45 2.45l1.514 1.514a4 4 0 00-5.478-5.478z"
                                            clipRule="evenodd"
                                        />
                                        <path d="M12.454 16.697L9.75 13.992a4 4 0 01-3.742-3.741L2.335 6.578A9.98 9.98 0 00.458 10c1.274 4.057 5.065 7 9.542 7 .847 0 1.669-.105 2.454-.303z" />
                                    </svg>
                                </button>
                            </div>

                            {/* Password strength meter */}
                            <div className="password-strength-meter password-strength-strong">
                                <div className="segment"></div>
                                <div className="segment"></div>
                                <div className="segment"></div>
                                <div className="segment"></div>
                            </div>
                            <div className="password-strength-text password-strength-strong">Strong password</div>

                            {/* Adding some vertical space */}
                            <div className="mb-4"></div>

                            <div className="mb-4 relative">
                                <input type="password" placeholder="Confirm Password" disabled />
                            </div>

                            <div className="mb-6">
                                <p className="text-sm mb-2 font-medium">I am a:</p>
                                <div className="role-toggle-container">
                                    <button type="button" className="role-btn active">
                                        Tutor
                                    </button>
                                    <button type="button" className="role-btn">
                                        Lecturer
                                    </button>
                                </div>
                            </div>

                            <div className="text-center mt-8">
                                <Link href="/signin" className="sign-in-button inline-block py-2 px-5">
                                    Go to Sign In
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            </Layout>
        </>
    );
}
