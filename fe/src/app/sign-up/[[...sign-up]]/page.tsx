import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
    return (
        <div
            style={{
                minHeight: "100vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                background: "#0a0a0a",
            }}
        >
            <SignUp
                appearance={{
                    elements: {
                        rootBox: {
                            boxShadow: "0 4px 24px rgba(0,0,0,0.5)",
                        },
                        card: {
                            background: "#141414",
                            border: "1px solid #2a2a2a",
                        },
                        headerTitle: {
                            color: "#ffffff",
                        },
                        headerSubtitle: {
                            color: "#888",
                        },
                        socialButtonsBlockButton: {
                            background: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            color: "#ffffff",
                        },
                        formFieldLabel: {
                            color: "#ccc",
                        },
                        formFieldInput: {
                            background: "#1a1a1a",
                            border: "1px solid #2a2a2a",
                            color: "#ffffff",
                        },
                        formButtonPrimary: {
                            background: "#ffffff",
                            color: "#000000",
                        },
                        footerActionLink: {
                            color: "#ffffff",
                        },
                    },
                }}
            />
        </div>
    );
}
