import { Request, Response } from "express";
export declare class DocumentController {
    uploadDocument(req: Request, res: Response): Promise<void>;
    listDocuments(req: Request, res: Response): Promise<void>;
    deleteDocument(req: Request, res: Response): Promise<void>;
}
export declare const documentController: DocumentController;
//# sourceMappingURL=document.controller.d.ts.map