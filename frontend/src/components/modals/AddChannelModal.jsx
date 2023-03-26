import React, { useEffect, useRef } from 'react';
import { useFormik } from 'formik';
import leoProfanity from 'leo-profanity';
import {
  Modal, Form, Button, FormControl,
} from 'react-bootstrap';
import * as yup from 'yup';
import { useSelector } from 'react-redux';

import { useSocketApi } from '../../hooks/index.jsx';

const channelsValidationSchema = (channelsNames) => yup.object().shape({
  name: yup
    .string()
    .trim()
    .required('required')
    .min(3, 'min')
    .max(20, 'max')
    .notOneOf(channelsNames, 'duplicate'),
  // тут в аргументы i18n нужно
});

const AddChannelModal = ({ onHide }) => {
  const channels = useSelector((s) => s.channelsInfo.channels);
  const channelsNames = channels.map((channel) => channel.name);
  const socketApi = useSocketApi();

  const input = useRef(null);

  useEffect(() => {
    input.current.focus();
  }, []);

  const formik = useFormik({
    initialValues: {
      name: '',
    },
    validationSchema: channelsValidationSchema(channelsNames),
    onSubmit: async (values) => {
      leoProfanity.loadDictionary('ru');
      const cleanedName = leoProfanity.clean(values.name);
      try {
        await socketApi.newChannel(cleanedName, onHide);
        formik.values.name = '';
      } catch (error) {
        console.error(error.message);
      }
    },
  });

  return (
    <Modal show centered onHide={onHide}>
      <Modal.Header closeButton>
        <Modal.Title>Добавить канал</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form onSubmit={formik.handleSubmit}>
          <Form.Group>
            <Form.Control
              className="mb-2"
              ref={input}
              id="name"
              name="name"
              required
              onChange={formik.handleChange}
              value={formik.values.name}
              isInvalid={!!formik.errors.name}
            />
            <Form.Label htmlFor="name" visuallyHidden>Имя канала</Form.Label>
            <FormControl.Feedback type="invalid">
              {formik.errors.name}
            </FormControl.Feedback>
            <Modal.Footer>
              <Button
                variant="secondary"
                type="button"
                onClick={onHide}
              >
                Отменить
              </Button>
              <Button
                variant="primary"
                type="submit"
                onClick={formik.handleSubmit}
                disabled={formik.errors.name}
              >
                Отправить
              </Button>
            </Modal.Footer>
          </Form.Group>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default AddChannelModal;
