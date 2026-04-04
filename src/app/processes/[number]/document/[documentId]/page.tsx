"use client";
import { useParams, useRouter } from "next/navigation";
import { ProcessDocumentModal } from "@/components/process/ProcessDocumentModal";

export default function ProcessDocumentPage() {
  const params = useParams();
  const router = useRouter();
  const processNumber = params?.number as string;
  const documentId = params?.documentId as string;

  return (
    <div className="min-h-screen bg-background">
      <ProcessDocumentModal
        processNumber={processNumber}
        documentId={documentId}
        isOpen={true}
        onClose={() => {
          if (window.opener) {
            window.close();
          } else {
            router.back();
          }
        }}
      />
    </div>
  );
}
