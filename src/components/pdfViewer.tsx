import React, { useEffect, useState } from "react";
import { Document, Page } from "react-pdf/dist/esm/entry.webpack5";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import "./pdfViewer.css";
import { PDFDocumentProxy } from "pdfjs-dist";
import { useDebounce } from "./debounce";

const options = {
  cMapUrl: "cmaps/",
  standardFontDataUrl: "standard_fonts/",
};

type PDFFile = string | File | null;

export default function PDFViewer() {
  const [file, setFile] = useState<PDFFile>("");
  const [numPages, setNumPages] = useState<number>();
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState<number>(1);
  const [zoomInputValue, setZoomInputValue] = useState<number>(scale * 100);
  const debouncedZoomInputValue = useDebounce(zoomInputValue, 500);

  function onDocumentLoadSuccess({ numPages: nextNumPages }: PDFDocumentProxy) {
    setNumPages(nextNumPages);
  }

  function handleNextPage() {
    setPageNumber((prevPageNumber) => prevPageNumber + 1);
  }

  function handlePrevPage() {
    setPageNumber((prevPageNumber) => prevPageNumber - 1);
  }

  function handleZoomIn() {
    setScale((prevScale) => prevScale + 0.1);
  }

  function handleZoomOut() {
    setScale((prevScale) => prevScale - 0.1);
  }

  function handleZoomChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newScale = parseFloat(e.target.value) / 100;
    if (!isNaN(newScale)) {
      setScale(newScale);
    }
  }

  function handleZoomInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const newValue = parseFloat(e.target.value);
    setZoomInputValue(newValue);
  }

  useEffect(() => {
    const newScale = debouncedZoomInputValue / 100;
    if (!isNaN(newScale)) {
      setScale(newScale);
    }
  }, [debouncedZoomInputValue]);

  return (
    <div className="Example">
      <header>
        <p>
          Page {pageNumber} of {numPages}
        </p>
      </header>
      <div className="Example__container">
        <div className="Example__container__document">
          <Document file={file} onLoadSuccess={onDocumentLoadSuccess} options={options}>
            <Page pageNumber={pageNumber} scale={scale} />
          </Document>
        </div>
        <div className="Example__container__controls">
          <button disabled={pageNumber === 1} onClick={handlePrevPage}>
            Prev
          </button>
          <select value={pageNumber} onChange={(e) => setPageNumber(parseInt(e.target.value))}>
            {Array.from(Array(numPages), (_, i) => i + 1).map((page) => (
              <option key={page} value={page}>
                {page}
              </option>
            ))}
          </select>
          <button disabled={pageNumber === numPages} onClick={handleNextPage}>
            Next
          </button>
          <div className="Example__container__controls__zoom">
            <button onClick={handleZoomIn}>+</button>
            <input type="text" value={zoomInputValue} onChange={handleZoomInputChange} style={{ width: "60px" }} />
            <button onClick={handleZoomOut}>-</button>
          </div>
          <p>Zoom: {Math.round(scale * 100)}%</p>
        </div>
      </div>
    </div>
  );
}
