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

export class AlertUploadFile{
  title: string = 'คำถาม';
  text: string = "ต้องการอัพโหลดไฟล์ หรือ ไม่ ?";
  icon: string = "question";
}

@Component({
  selector: 'app-upload-file',
  templateUrl: './upload-file.component.html',
  styleUrls: ['./upload-file.component.scss'],
})



export class UploadFileComponent implements OnInit {
  public formGroup!: FormGroup;
  public _file!: any;
  public _dealerName!: any;
  public formData!: any;
  public dealer!: string;
  public id!: string;
  constructor(
    private fb: FormBuilder,
    private uploadApi: UploadFileApi,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe((params) => {
      console.log('paramMap',params);
      this.dealer = params['dealer'];
      this.id = params['id'];
    });

    this.formGroup = this.fb.group({
      file: ['', [Validators.required]],
    });
    this.dealerName()
  }

  get file() {
    return this.formGroup.controls['file'];
  }

  dealerName() {
    let formData = new FormData();
    formData.append('controller', 'loadDealerName');
    formData.append('dealerCode', this.dealer);

    this.uploadApi.DealerName(formData).subscribe(
      (response) => {
        this._dealerName = response.data
        // console.log('dealerName-success',response)
      },
      (error) => {
        // this.handleUploadFleError(error);
        console.log('dealerName-err',error)
      }
    );
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
        this.formData.append('dealerCode', this.dealer);
        this.formData.append('comPaymentId', this.id);
      }
    }
  }

  handleCheckUploadFile(){
    let formData = new FormData();
    formData.append('controller', 'checkUploadFile');
    formData.append('comPaymentId', this.id);

    this.uploadApi.CheckUploadFile(formData).subscribe(
      (response) => {
        console.log('handleCheckUploadFile',response)
        // this.handleConfirmUploadFile();
        if(response.data.st){
          let modelAlert = new AlertUploadFile();
          modelAlert.title = 'คำเตือน';
          modelAlert.text = "ต้องการอัพโหลดไฟล์อีกครั้ง หรือ ไม่ ?";
          modelAlert.icon = "warning";
          this.handleConfirmUploadFile(modelAlert)
          this.formData.append('replyStatus', true);
        }else{
          this.handleConfirmUploadFile(new AlertUploadFile())
        }
      },
      (error) => {
        this.handleUploadFleError(error);
        console.log('handleCheckUploadFile',error)

      }
    );
  }
  handleConfirmUploadFile(modelAlert: any ){
    let resChkSendEmail = Swal.fire({
      title: modelAlert.title,
      icon: modelAlert.icon,
      text: modelAlert.text,
      inputAttributes: {
          autocapitalize: 'off'
      },
      showCancelButton: true,
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      showLoaderOnConfirm: true,
      preConfirm: (login) => {
        this.handleUploadFle()
      },
      allowOutsideClick: () => !Swal.isLoading()
    });
  }

  handleUploadFle(){
    // ถ้าไม่มีข้อมูล ไม่สามารถบันทึกข้อมูลได้
    if(!this.dealer || !this.id){
      // console.log('this.dealer',{dealer :this.dealer,id: this.id});
      this.handleUploadFleError('err');
      return false;
    }
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
    Swal.fire({
      title: 'คำเตือน',
      icon: 'error',
      html: `<p>เอกสารของท่านถูกอัพโหลดไม่สำเร็จ</p><p>กรุณาติดต่อเจ้าหน้าที่</p>`
    });
  }
}
