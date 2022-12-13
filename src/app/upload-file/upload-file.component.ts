import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { finalize, Subscription } from 'rxjs';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})
export class UploadFileComponent implements OnInit {
  public formGroup!: FormGroup;
  public _file!: any;
  public formData!: any;
  uploadProgress!: any;
  uploadSub!: Subscription;
  total!: any;
  constructor(private fb: FormBuilder, private http: HttpClient) {}

  ngOnInit() {
    this.formGroup = this.fb.group({
      file: ['', [Validators.required]],
    });
  }

  get file() {
    return this.formGroup.controls['file'];
  }

  uploadFile(event: any) {
    const file: File = event.target.files[0];

    if (file) {
      if (Math.round(file.size / 1024) > 3000) {
        Swal.fire(
          'ตำเตือน',
          `ไฟล์ของท่านมีขนาดใหญ่เกินไป ${Math.round(file.size / 1024) + ' KB'}`,
          'error'
        );
      } else {
        this._file = file.name;
        this.formData = new FormData();
        this.formData.append('controller', 'uploadFile');
        this.formData.append('thumbnail', file);
      }
    }
  }

  handleUploadFle() {
    console.log('formData', this.formData);
    const upload$ = this.http
      .post('/api/thumbnail-upload', this.formData, {
        reportProgress: true,
        observe: 'events',
      })
      .pipe(finalize(() => this.reset()));

    this.uploadSub = upload$.subscribe((event) => {
      if (event.type == HttpEventType.UploadProgress) {
        this.total = event.total;
        this.uploadProgress = Math.round(100 * (event.loaded / this.total));
      }
    });
  }

  reset() {
    this.uploadProgress = null;
  }
}
