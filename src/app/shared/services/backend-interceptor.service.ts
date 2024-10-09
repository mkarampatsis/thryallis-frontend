import { Injectable, Injector, inject } from '@angular/core';
import {
    HttpInterceptor,
    HttpRequest,
    HttpHandler,
    HttpEvent,
    HttpResponse,
    HttpErrorResponse,
} from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { ModalService } from './modal.service';
import { Toast, ToastService } from './toast.service';
import { ToastMessageComponent } from 'src/app/shared/components/toast-message/toast-message.component';

@Injectable()
export class BackendInterceptor implements HttpInterceptor {
    modalService = inject(ModalService);

    toastService = inject(ToastService);

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            tap((event) => {
                if (event instanceof HttpResponse) {
                    // console.log('Event:', event);
                    if (event.status === 201) {
                        const message = event.body.message;
                        const toast: Toast = {
                            component: ToastMessageComponent,
                            inputs: { message },
                            classname: 'bg-success text-light',
                            delay: 5000,
                        };
                        this.toastService.show(toast);
                    }
                    if (event.status === 211) {
                        const message = event.body.message;
                        const toast: Toast = {
                            component: ToastMessageComponent,
                            inputs: { message },
                            classname: 'bg-info text-light',
                            delay: 5000,
                        };
                        this.toastService.show(toast);
                    }
                }
            }),
            catchError((response: HttpErrorResponse): Observable<any> => {
                console.log('============= ERROR =============');
                console.log(response);
                console.log('============= ERROR =============');
                if (response.error) {
                    const message = response.error.message;
                    const toast: Toast = {
                        component: ToastMessageComponent,
                        inputs: { message },
                        classname: 'bg-danger text-light',
                        delay: 5000,
                    };
                    this.toastService.show(toast);
                }
                if (response.status === 413) {
                    const toast: Toast = {
                        component: ToastMessageComponent,
                        inputs: {
                            message: 'Το αρχείο είναι πολύ μεγάλο για αποστολή (μέγιστο μέγεθος 16ΜΒ).',
                        },
                        classname: 'bg-danger text-light',
                        delay: 5000,
                    };
                    this.toastService.show(toast);
                }
                return throwError(() => new Error(response.error.error));
            }),
        );
    }
}
