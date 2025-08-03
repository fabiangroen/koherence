import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
    DialogClose
} from "@/components/ui/dialog"

export default function FileUpload() {
    return (
        <Dialog>
            <DialogTrigger>
                <div className="w-30 flex justify-end">
                    <Button className="group flex justify-end w-10 hover:w-30 transition-all">
                        <DialogTitle><div className="scale-0 group-hover:scale-100 transition-all">Upload File</div></DialogTitle>
                        <Plus className="h-4 w-4" />
                    </Button>
                </div>
            </DialogTrigger>
            <DialogContent className="overflow-hidden bg-card text-card-foreground rounded-xl border p-2">
                {/* File upload form or component can be added here */}
                <DialogTitle>
                    Upload e-book
                </DialogTitle>
                <DialogClose />
            </DialogContent>
        </Dialog>
    )
}
