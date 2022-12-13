import { HttpClient, HttpEventType } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import {
  FormControl,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, ParamMap } from '@angular/router';
import { finalize, Subscription } from 'rxjs';
import { UploadFileApi } from 'src/api';
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
  public dealer!: number;
  public id!: number;
  constructor(
    private fb: FormBuilder,
    private uploadApi: UploadFileApi,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.paramMap.subscribe((params) => {
      this.dealer = Number(params.get('dealer'));
      this.id = Number(params.get('id'));
    });

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
    this.uploadApi.UploadFile(this.formData).subscribe(
      (response) => {
        this.handleUploadFleNext(response);
      },
      (error) => {
        this.handleUploadFleError(error);
      }
    );
  }
  handleUploadFleNext(response: any) {
    console.log(response);
    Swal.fire('สำเร็จ', `เอกสารของท่านถูกอัพโหลดเรียบร้อย`, 'success');
  }
  handleUploadFleError(error: any) {
    console.log(error);
    Swal.fire('คำเตือน', `เอกสารของท่านถูกอัพโหลดไม่สำเร็จ`, 'error');
  }
}
