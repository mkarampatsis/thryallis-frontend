import { CommonModule } from '@angular/common';
import { HttpEventType, HttpResponse } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { FileUploadService } from 'src/app/shared/services/file-upload.service';

@Component({
    selector: 'app-file-upload',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './file-upload.component.html',
    styleUrl: './file-upload.component.css',
})
export class FileUploadComponent implements OnInit {
    uploadService = inject(FileUploadService);
    currentFile: File;
    progress = 0;
    message = '';
    fileInfos: Observable<any> | undefined = undefined;
    modalRef: any;

    ngOnInit(): void {
        this.fileInfos = this.uploadService.getFiles();
        this.fileInfos.subscribe((values) => {
            console.log(values);
        });
    }

    selectFile(event: any): void {
        this.currentFile = event.target.files[0];
    }

    upload(): void {
        if (this.currentFile) {
            this.uploadService.upload(this.currentFile).subscribe({
                next: (event: any) => {
                    if (event.type === HttpEventType.UploadProgress) {
                        this.progress = Math.round(
                            (100 * event.loaded) / event.total,
                        );
                    } else if (event instanceof HttpResponse) {
                        this.message = event.body.message;
                        this.fileInfos = this.uploadService.getFiles();
                    }
                },
                error: (err: any) => {
                    console.log(err);

                    if (err.error && err.error.message) {
                        this.message = err.error.message;
                    } else {
                        this.message = 'Could not upload the file!';
                    }

                    this.currentFile = undefined;
                    this.progress = 0;
                },
                complete: () => {
                    this.currentFile = undefined;
                },
            });
        }
    }
}
