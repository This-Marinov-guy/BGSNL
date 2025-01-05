import React from "react";
import { Field, ErrorMessage } from "formik";
import { CalendarWithClock } from "../../inputs/common/Calendar";
import { capitalizeFirstLetter } from "../../../util/functions/capitalize";
import { REGIONS } from "../../../util/defines/REGIONS_DESIGN";
import styled from "styled-components";

// Styled Components
const FormWrapper = styled.div`
  padding: 25px;
  background-color: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  border: 4px solid #00966e; /* Bulgarian green */
`;

const SectionTitle = styled.h3`
  font-size: 1.8rem;
  color: #d6262b; /* Bulgarian red */
  margin-bottom: 20px;
  border-bottom: 3px solid #d6262b;
  padding-bottom: 8px;
  font-family: "Verdana", sans-serif;
`;

const Row = styled.div`
  display: flex;
  flex-wrap: wrap;
  margin-bottom: 24px;
  gap: 20px;
`;

const Col = styled.div`
  flex: 1 1 calc(50% - 20px);
  min-width: 300px;

  @media (max-width: 768px) {
    flex: 1 1 100%;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const Input = styled(Field)`
  padding: 16px;
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #d6262b; /* Bulgarian red */
    outline: none;
    box-shadow: 0 0 6px rgba(214, 38, 43, 0.4);
  }
`;

const TextArea = styled(Input).attrs({ as: "textarea" })`
  resize: vertical;
`;

const Select = styled(Field).attrs({ as: "select" })`
  font-size: 1.1rem;
  border: 2px solid #ddd;
  border-radius: 8px;
  background-color: #fff; /* Ensure visible background */
  color: #333; /* Ensure text is visible */
  transition: border-color 0.3s ease;

  &:focus {
    border-color: #d6262b; /* Bulgarian red */
    outline: none;
    box-shadow: 0 0 6px rgba(214, 38, 43, 0.4);
  }

  option {
    background-color: #fff; /* Matches the select background */
    color: #333; /* Text color inside the dropdown */
    font-size: 1rem;
  }
`;

const Error = styled(ErrorMessage)`
  color: #e74c3c;
  font-size: 1rem;
`;

// Component
const BasicInfo = ({ values, setFieldValue, edit }) => {
  return (
    <FormWrapper>
      <SectionTitle>Basic Information</SectionTitle>
      <Row>
        <Col>
          <FormGroup>
            <Select disabled={edit} name="region" value={values.region} onChange={(e) => setFieldValue("region", e.target.value)}>
              <option value="" disabled>
                Select Region
              </option>
              {REGIONS.map((val, index) => (
                <option value={val} key={index}>
                  {capitalizeFirstLetter(val)}
                </option>
              ))}
            </Select>
            <Error name="region" component="div" />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Input
              type="text"
              placeholder="Location of event"
              name="location"
            />
            <Error name="location" component="div" />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Input type="text" placeholder="Event Name" name="title" />
            <Error name="title" component="div" />
          </FormGroup>
        </Col>
        <Col>
          <FormGroup>
            <Input type="text" placeholder="Sub-Title" name="description" />
            <Error name="description" component="div" />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <CalendarWithClock
              mode="single"
              locale="en-nl"
              placeholder="Date and Time"
              captionLayout="dropdown"
              initialValue={values.date}
              min={new Date()}
              onSelect={(value) => setFieldValue("date", value)}
            />
            <Error name="date" component="div" />
          </FormGroup>
        </Col>
      </Row>
      <Row>
        <Col>
          <FormGroup>
            <Field
              as="textarea"
              placeholder="Full Description"
              name="text"
              rows={6}
              className="rn-input"
            />
            <Error name="text" component="div" />
          </FormGroup>
        </Col>
      </Row>
    </FormWrapper>
  );
};

export default BasicInfo;
