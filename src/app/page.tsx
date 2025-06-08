import Image from "next/image";
import { Button } from "@/components/ui/button";
import { UserButton } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import  Link  from "next/link";
import {LogIn} from  'lucide-react'
import FileUpload from "@/components/FileUpload";
export default async function Home() {
  const { userId } = await auth();
  const isAuth = !!userId;

  return (
    <div className="w-screen min-h-screen relative bg-white">
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div className="flex flex-col items-center text-center">
          <div className="flex items-center mb-4">
            <h1 className="mr-3 text-5xl font-semibold">Chat with any PDF</h1>
            <UserButton afterSignOutUrl="/" />
          </div>
          <div className="flex mb-4">
            {isAuth && <Button>Go to Chats</Button>}
          </div>
          <p className="max-w-xl text-lg text-slate-800">
            Join millions of professionals and build your career with our AI-powered
            resume builder.
          </p>
         <div className="w-full mt-4">
{isAuth ? (<FileUpload/>):(
  <Link href="/sign-in">
   <Button>Login to get Started
    <LogIn className="w-4 h-4 ml-2"/>
   </Button>
  </Link>
)}
         </div>
        </div>
      </div>
    </div>
  );
}
