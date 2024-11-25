import React, { useState, useEffect } from "react";
import Papa from "papaparse";
import { db, collection, addDoc, getDocs } from "../firebase"; // Corrected import path
import {
  Card,
  CardHeader,
  CardBody,
  CardTitle,
  Table,
  Row,
  Col,
  Button,
  Pagination,
  PaginationItem,
  PaginationLink,
} from "reactstrap";

function Tables() {
  const [tableData, setTableData] = useState([]);
  const [headers, setHeaders] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(15);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch data from Firestore when the component mounts
  useEffect(() => {
    fetchDataFromFirestore();
  }, []);

  // Function to fetch data from Firestore
  const fetchDataFromFirestore = async () => {
    const querySnapshot = await getDocs(collection(db, "csv_data"));
    const data = querySnapshot.docs.map((doc) => doc.data());

    if (data.length > 0) {
      setHeaders(Object.keys(data[0])); // Set headers from first data row
    }
    setTableData(data);
    setTotalPages(Math.ceil(data.length / itemsPerPage)); // Calculate total pages
  };

  // Function to handle file upload and parse CSV
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const { data, meta } = results;
          setHeaders(meta.fields); // Set headers from CSV file
          setTableData(data); // Set table data from CSV file

          // Upload CSV data to Firestore
          uploadCSVToFirestore(data);

          // Update total pages after data is set
          setTotalPages(Math.ceil(data.length / itemsPerPage));
        },
      });
    }
  };

  // Function to upload CSV data to Firestore
  const uploadCSVToFirestore = (data) => {
    const collectionRef = collection(db, "csv_data");

    data.forEach((row) => {
      addDoc(collectionRef, row)
        .then(() => {
          console.log("Document added successfully!");
        })
        .catch((error) => {
          console.error("Error adding document: ", error);
        });
    });
  };

  // Function to change the current page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Function to get current data to be displayed on the table
  const getCurrentData = () => {
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    return tableData.slice(indexOfFirstItem, indexOfLastItem);
  };

  // Function to generate page numbers to display
  const generatePageNumbers = () => {
    let pages = [];
    const totalPagesToShow = 10; // Limit to 10 page numbers at most
    let startPage = Math.max(1, currentPage - 4); // Center the current page
    let endPage = Math.min(totalPages, startPage + totalPagesToShow - 1);

    if (endPage - startPage < totalPagesToShow - 1) {
      startPage = Math.max(1, endPage - totalPagesToShow + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <Card style={{ height: "1000px" }}>
              <CardHeader>
                <CardTitle tag="h4">Simple Table with CSV Upload</CardTitle>
              </CardHeader>
              <CardBody>
                <div style={{ marginBottom: "20px" }}>
                  <input
                    type="file"
                    accept=".csv"
                    onChange={handleFileUpload}
                    style={{ marginRight: "10px" }}
                  />
                  <Button color="primary">Upload CSV</Button>
                </div>
                <Table responsive>
                  <thead className="text-primary">
                    <tr>
                      {headers.map((header, index) => (
                        <th key={index}>{header}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {getCurrentData().map((row, index) => (
                      <tr key={index}>
                        {headers.map((header, idx) => (
                          <td key={idx}>{row[header]}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </Table>

                {/* Pagination */}
                <Pagination>
                  <PaginationItem disabled={currentPage === 1}>
                    <PaginationLink
                      previous
                      onClick={() => handlePageChange(currentPage - 1)}
                    />
                  </PaginationItem>

                  {generatePageNumbers().map((page) => (
                    <PaginationItem key={page} active={page === currentPage}>
                      <PaginationLink onClick={() => handlePageChange(page)}>
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}

                  <PaginationItem disabled={currentPage === totalPages}>
                    <PaginationLink
                      next
                      onClick={() => handlePageChange(currentPage + 1)}
                    />
                  </PaginationItem>
                </Pagination>
              </CardBody>
            </Card>
          </Col>
        </Row>
      </div>
    </>
  );
}

export default Tables;
