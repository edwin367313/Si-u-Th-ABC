import React, { useState } from 'react';
import { Upload, Button, message, Modal } from 'antd';
import { UploadOutlined, PlusOutlined } from '@ant-design/icons';
import { validateFileSize, validateFileType } from '../../utils/validation';
import './ImageUploader.css';

const ImageUploader = ({ 
  onUploadSuccess, 
  maxSize = 5, // MB
  acceptedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'],
  multiple = false,
  listType = 'picture-card'
}) => {
  const [fileList, setFileList] = useState([]);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState('');

  const beforeUpload = (file) => {
    // Validate file size
    const sizeValid = validateFileSize(file, maxSize);
    if (!sizeValid) {
      message.error(`Kích thước file không được vượt quá ${maxSize}MB`);
      return Upload.LIST_IGNORE;
    }

    // Validate file type
    const typeValid = validateFileType(file, acceptedTypes);
    if (!typeValid) {
      message.error('Chỉ chấp nhận file ảnh (JPG, PNG, WEBP)');
      return Upload.LIST_IGNORE;
    }

    return false; // Prevent auto upload
  };

  const handleChange = ({ fileList: newFileList }) => {
    setFileList(newFileList);
  };

  const handleUpload = async () => {
    if (fileList.length === 0) {
      message.warning('Vui lòng chọn ảnh để upload');
      return;
    }

    const formData = new FormData();
    fileList.forEach((file) => {
      formData.append('images', file.originFileObj);
    });

    try {
      // Call upload API
      if (onUploadSuccess) {
        await onUploadSuccess(formData);
        setFileList([]);
        message.success('Upload ảnh thành công');
      }
    } catch (error) {
      message.error('Upload ảnh thất bại');
    }
  };

  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
  };

  const getBase64 = (file) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = (error) => reject(error);
    });

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Chọn ảnh</div>
    </div>
  );

  return (
    <div className="image-uploader">
      <Upload
        listType={listType}
        fileList={fileList}
        beforeUpload={beforeUpload}
        onChange={handleChange}
        onPreview={handlePreview}
        multiple={multiple}
        accept={acceptedTypes.join(',')}
      >
        {fileList.length >= (multiple ? 8 : 1) ? null : uploadButton}
      </Upload>

      {fileList.length > 0 && (
        <Button
          type="primary"
          onClick={handleUpload}
          icon={<UploadOutlined />}
          style={{ marginTop: 16 }}
        >
          Upload {fileList.length} ảnh
        </Button>
      )}

      <Modal
        open={previewOpen}
        footer={null}
        onCancel={() => setPreviewOpen(false)}
      >
        <img alt="preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>
    </div>
  );
};

export default ImageUploader;
