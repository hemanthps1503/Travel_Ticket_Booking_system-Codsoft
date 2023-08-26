import React, { useEffect, useRef, useState } from 'react';
import Pagetitle from '../components/pagetitle';
import Busform from '../components/busform';
import { useDispatch } from 'react-redux';
import { Hideloading, Showloading } from '../redux folder/alertSlice';
import { Modal, Table, message } from 'antd';
import { axiosInstance } from '../helpers/axiosinstance';
import moment from 'moment';
import axios from 'axios';
import { useReactToPrint } from 'react-to-print';

function Booking() {
  const [showprintmodel, setshowprintmodel] = useState(false);
  const [selectedbooking, setselectedbooking] = useState(null);
  const [bookings, setbookings] = useState([]);
  const dispatch = useDispatch();
  const getBookings = async () => {
    try {
      dispatch(Showloading());
      const response = await axiosInstance.post(
        '/api/bookings/get-bookings-by-user-id',
        {}
      );
      dispatch(Hideloading());
      if (response.data.success) {
        const mappeddata = response.data.data.map((booking) => {
          return {
            ...booking,
            ...booking.bus,

            key: booking._id,
          };
        });
        setbookings(mappeddata);
      } else {
        message.error(response.data.message);
      }
    } catch (error) {
      dispatch(Hideloading());
      message.error(error.message);
    }
  };
  const columns = [
    {
      title: 'Bus Name',
      dataIndex: 'name',
      key: 'bus,',
    },
    {
      title: 'Bus Number',
      dataIndex: 'number',
      key: 'bus',
    },
    {
      title: 'Journey Date',
      dataIndex: 'journeyDate',
    },
    {
      title: 'Journey Time',
      dataIndex: 'departure',
    },
    {
      title: 'Seats',
      dataIndex: 'seats',
      render: (seats) => {
        return seats.join(', ');
      },
    },
    {
      title: 'Action',
      dataIndex: 'action',
      render: (text, record) => (
        <div>
          <p
            className="text-md underline"
            onClick={() => {
              setselectedbooking(record);
              setshowprintmodel(true);
            }}
          >
            {' '}
            Print Ticket
          </p>
        </div>
      ),
    },
  ];

  useEffect(() => {
    getBookings();
  }, []);

  const componentRef = useRef();
  const handlePrint = useReactToPrint({
    content: () => componentRef.current,
  });
  return (
    <div>
      <Pagetitle title="Bookings" />
      <div className="mt-2">
        <Table dataSource={bookings} columns={columns} />
      </div>
      {showprintmodel && (
        <Modal
          title="Print Ticket"
          onCancel={() => {
            setshowprintmodel(false);
            setselectedbooking(null);
          }}
          visible={showprintmodel}
          okText="Print"
          onOk={handlePrint}
        >
          <hr />
          <div className="d-flex flex-column p-5" ref={componentRef}>
            <p>Bus :{selectedbooking.name}</p>
            <p>
              {selectedbooking.from} - {selectedbooking.to}
            </p>
            <hr />
            <p>
              <span>Journey Date : </span>{' '}
              {moment(selectedbooking.journeyDate).format('DD-MM-YYYY')}
            </p>
            <p>
              <span>Journey Time : </span>
              {''}
              {selectedbooking.departure}
            </p>
            <hr />
            <p>
              <span>Seat Numbers : </span> <br />
              {selectedbooking.seats}
            </p>
            <hr />
            <p>
              <span>Total Amount : </span>{' '}
              {selectedbooking.fare * selectedbooking.seats.length}
            </p>
          </div>
        </Modal>
      )}
    </div>
  );
}
export default Booking;
